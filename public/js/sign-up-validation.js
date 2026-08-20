/**
 * =====================================================
 * SIGN UP FORM VALIDATION
 * =====================================================
 */

document.addEventListener( "DOMContentLoaded", () => {

    /**
     * =====================================================
     * FORM ELEMENTS
     * =====================================================
     */

    const form = document.getElementById( "signUpForm" );
    // const form = document.getElementById( "signUpForm" );

    if ( !form ) return;



    /**
     * =====================================================
     * INPUT FIELDS
     * =====================================================
     */

    const fields = {
        name: document.getElementById( "name" ),
        email: document.getElementById( "email" ),
        password: document.getElementById( "password" ),
        confirmPassword: document.getElementById( "confirmPassword" ),
    };



    /**
     * =====================================================
     * ERROR ELEMENTS
     * =====================================================
     */

    const errorElements = {
        name: document.getElementById( "nameError" ),
        email: document.getElementById( "emailError" ),
        password: document.getElementById( "passwordError" ),
        confirmPassword: document.getElementById( "confirmPasswordError" ),
    };



    /**
     * =====================================================
     * VALIDATION RULES
     * =====================================================
     */

    const validators = {

        name ( value ) {

            if ( !value.trim() ) {
                return "Name is required";
            }

            if ( value.trim().length < 2 ) {
                return "Name must be at least 2 characters";
            }

            if ( value.trim().length > 50 ) {
                return "Name cannot exceed 50 characters";
            }

            return "";

        },



        email ( value ) {

            if ( !value.trim() ) {
                return "Email is required";
            }

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if ( !emailRegex.test( value.trim() ) ) {
                return "Please enter a valid email address";
            }

            return "";

        },



        password ( value ) {

            if ( !value ) {
                return "Password is required";
            }

            if ( value.length < 8 ) {
                return "Password must be at least 8 characters";
            }

            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

            if ( !passwordRegex.test( value ) ) {
                return "Password must contain uppercase, lowercase, and number";
            }

            return "";

        },



        confirmPassword ( value ) {

            if ( !value ) {
                return "Please confirm your password";
            }

            if ( value !== fields.password.value ) {
                return "Passwords do not match";
            }

            return "";

        },

    };



    /**
     * =====================================================
     * SHOW ERROR
     * =====================================================
     */

    const showError = ( fieldName, message ) => {

        const field = fields[ fieldName ];
        const errorElement = errorElements[ fieldName ];

        if ( !field || !errorElement ) return;



        field.classList.add( "is-invalid" );
        field.classList.remove( "is-valid" );

        errorElement.textContent = message;

    };



    /**
     * =====================================================
     * SHOW SUCCESS
     * =====================================================
     */

    const showSuccess = ( fieldName ) => {

        const field = fields[ fieldName ];
        const errorElement = errorElements[ fieldName ];

        if ( !field || !errorElement ) return;



        field.classList.remove( "is-invalid" );

        if ( field.value.trim() !== "" ) {
            field.classList.add( "is-valid" );
        }

        errorElement.textContent = "";

    };



    /**
     * =====================================================
     * VALIDATE SINGLE FIELD
     * =====================================================
     */

    const validateField = ( fieldName ) => {
    console.log("🚀 ~ validateField ~ fieldName:", fieldName)

        const field = fields[ fieldName ];

        if ( !field ) return true;



        const validator = validators[ fieldName ];

        if ( !validator ) return true;



        const errorMessage =
            validator( field.value );



        if ( errorMessage ) {

            showError(
                fieldName,
                errorMessage
            );

            return false;

        }



        showSuccess( fieldName );

        return true;

    };



    /**
     * =====================================================
     * INPUT EVENT LISTENERS
     * =====================================================
     */

    Object.keys( fields ).forEach( ( fieldName ) => {

        const field = fields[ fieldName ];



        /**
         * Validate on typing
         */

        field.addEventListener(
            "input",
            () => {

                validateField( fieldName );



                /**
                 * Revalidate confirm password
                 * when password changes
                 */

                if (
                    fieldName === "password" &&
                    fields.confirmPassword.value
                ) {

                    validateField(
                        "confirmPassword"
                    );

                }

            }
        );



        /**
         * Validate on blur
         */

        field.addEventListener(
            "blur",
            () => {

                validateField( fieldName );

            }
        );

    } );



    /**
     * =====================================================
     * FORM SUBMIT
     * =====================================================
     */

    form.addEventListener(
        "submit",
        async ( event ) => {
            event.preventDefault();
            let isFormValid = true;



            Object.keys( fields ).forEach(
                ( fieldName ) => {

                    const isFieldValid =
                        validateField(
                            fieldName
                        );

                    if ( !isFieldValid ) {
                        isFormValid = false;
                    }

                }
            );



            /**
             * Prevent submit if invalid
             */

            if ( isFormValid ) {


      
            }

        }
    );

} );