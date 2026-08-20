/**
 * Form Validation & AJAX Submission Module
 * Reusable across all forms — attach with data-attributes
 */

const FormValidator = ( () => {
    // Validation rule engine
    const rules = {
        required: ( value ) => value.trim() !== "" || "This field is required",
        minLength: ( value, length ) =>
            value.length >= length || `Must be at least ${ length } characters`,
        maxLength: ( value, length ) =>
            value.length <= length || `Cannot exceed ${ length } characters`,
        email: ( value ) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( value ) || "Please enter a valid email",
        password: ( value ) =>
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test( value ) ||
            "Must contain uppercase, lowercase, and number",
        match: ( value, targetValue ) => value === targetValue || "Passwords do not match",
    };

    // Field configurations
    const fieldConfigs = {
        name: [
            { rule: "required", msg: "Name is required" },
            { rule: "minLength", arg: 2, msg: "Name must be at least 2 characters" },
            { rule: "maxLength", arg: 50, msg: "Name cannot exceed 50 characters" },
        ],
        email: [
            { rule: "required", msg: "Email is required" },
            { rule: "email", msg: "Please enter a valid email address" },
        ],
        password: [
            { rule: "required", msg: "Password is required" },
            { rule: "minLength", arg: 8, msg: "Password must be at least 8 characters" },
            { rule: "password", msg: "Must contain uppercase, lowercase, and number" },
        ],
        confirmPassword: [
            { rule: "required", msg: "Please confirm your password" },
            {
                rule: "match",
                arg: () => document.getElementById( "password" )?.value,
                msg: "Passwords do not match",
            },
        ],
    };

    // Validate single field
    const validateField = ( fieldName, value ) => {
        const configs = fieldConfigs[ fieldName ];
        if ( !configs ) return "";

        for ( const config of configs ) {
            const arg = typeof config.arg === "function" ? config.arg() : config.arg;
            const result = rules[ config.rule ]( value, arg );

            if ( result !== true ) {
                return config.msg || result;
            }
        }   

        return "";
    };

    // Show/hide error
    const setFieldStatus = ( field, errorElement, error ) => {
        if ( !field || !errorElement ) return;

        if ( error ) {
            field.classList.add( "is-invalid" );
            field.classList.remove( "is-valid" );
            errorElement.textContent = error;
        } else {
            field.classList.remove( "is-invalid" );
            field.classList.add( "is-valid" );
            errorElement.textContent = "";
        }
    };

    // Clear field status
    const clearFieldStatus = ( field, errorElement ) => {
        if ( !field || !errorElement ) return;
        field.classList.remove( "is-invalid", "is-valid" );
        errorElement.textContent = "";
    };

    // Attach validation to form
    const attach = ( formId, options = {} ) => {
        const form = document.getElementById( formId );
        if ( !form ) return;

        const { onSubmit, debounceMs = 300 } = options;
        const fields = form.querySelectorAll( "input" );
        let debounceTimer;

        //============
        const formData = new FormData( form );
        const data = Object.fromEntries( formData.entries() );
        //============

        // Real-time validation
        fields.forEach( ( field ) => {
            const errorElement = document.getElementById( `${ field.id }Error` );

            field.addEventListener( "input", () => {
                clearTimeout( debounceTimer );
                debounceTimer = setTimeout( () => {
                    const error = validateField( field.name, field.value );
                    setFieldStatus( field, errorElement, error );
                }, debounceMs );
            } );

            field.addEventListener( "blur", () => {
                const error = validateField( field.name, field.value );
                setFieldStatus( field, errorElement, error );
            } );
        } );

        // Form submission
        form.addEventListener( "submit", async ( e ) => {
            e.preventDefault();

            let isValid = true;
            fields.forEach( ( field ) => {
                const errorElement = document.getElementById( `${ field.id }Error` );
                const error = validateField( field.name, field.value );

                if ( error ) isValid = false;
                setFieldStatus( field, errorElement, error );
            } );

            if ( !isValid ) {
                // Focus first invalid field
                const firstInvalid = form.querySelector( ".is-invalid" );
                firstInvalid?.focus();
                return;
            }

            // Call submit handler
            if ( onSubmit ) {
                await onSubmit( form );
            } else {
                form.submit(); // Fallback to normal submit
            }
        } );
    };

    return { attach, validateField };
} )();
