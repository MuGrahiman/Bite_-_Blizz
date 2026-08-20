

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
        errorElement.remove();
    };

    // Helpers
    function getFormData ( form ) {
        const data = {};
        form.querySelectorAll( "input" ).forEach( ( input ) => {
            data[ input.name ] = input.value;
        } );
        return data;
    }

    const getErrorElement = ( input ) => {
        const elementId = `${ input.id }Error`;
        let feedback = input.parentNode.querySelector( ".invalid-feedback" ) ||
            document.getElementById( elementId );
        if ( !feedback ) {
            feedback = document.createElement( "small" );
            feedback.className = "invalid-feedback";
            feedback.id = elementId;
            input.parentNode.appendChild( feedback );
        }
        return feedback;
    };

    function showFieldError ( input, message ) {
        let feedback = getErrorElement( input );
        setFieldStatus( input, feedback, message );
    }

    function clearFieldError ( input ) {
        const feedback = getErrorElement( input );
        clearFieldStatus( input, feedback );
    }
    // Validate entire form
    const validateForm = ( formData ) => {
        const errors = {};

        Object.keys( this.rules ).forEach( ( field ) => {
            const error = this.validateField( field, formData[ field ] || "", formData );
            if ( error ) {
                // errors.push( { field, message: error } );
                errors[ field ] = error;
            }
        } );

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    // Attach validation to form
    const attach = ( formId, options = {} ) => {
        const form = document.getElementById( formId );
        const { onSubmit, debounceMs = 300 } = options;
        let debounceTimer;

        if ( !form ) return;

        //============
        const formData = new FormData( form );
        const data = Object.fromEntries( formData.entries() ),
        const onValidationError = ( ( errors ) => {
            for ( const field in errors ) {

                showFieldError( field, errors[ field ] );

            }

        } );

        // Frontend validation first
        // if ( window.AuthValidator ) {
        const validation = validateForm( data );
        if ( !validation.isValid ) {
            onValidationError( validation.errors );
            return { success: false, errors: validation.errors };
        }
        // }
        //============

        // Real-time validation on blur
        form.querySelectorAll( "input" ).forEach( ( input ) => {
            input.addEventListener( "blur", () => {
                clearTimeout( debounceTimer );
                debounceTimer = setTimeout( () => {

                    const formData = getFormData( form );
                    const error = validateField( input.name, input.value, formData );
                    showFieldError( input, error );
                }, debounceMs );
            } );

            // Clear error on input
            input.addEventListener( "input", () => {
                clearFieldError( input );
            } );
        } );


        const fields = form.querySelectorAll( "input" );

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
    // Form submission with Axios
    form.addEventListener( "submit", async ( e ) => {
        e.preventDefault();
        FormHandler.clearErrors( form );
        messagesContainer.innerHTML = "";

        const result = await FormHandler.submit( form, {
            onSuccess: ( data ) => {
                FormHandler.showSuccess(
                    messagesContainer,
                    data.message || "Registration successful! Redirecting..."
                );

                // Clear form
                form.reset();

                // Redirect after delay
                setTimeout( () => {
                    window.location.href = data.redirectUrl || "/mail-confirmation";
                }, 2000 );
            },
            onValidationError: ( errors ) => {
                FormHandler.displayErrors( form, errors );
                // Focus first invalid field
                const firstInvalid = form.querySelector( ".is-invalid" );
                if ( firstInvalid ) firstInvalid.focus();
            },
            onError: ( error ) => {
                FormHandler.showError( messagesContainer, error.message || "Something went wrong. Please try again." );
            },
        } );

    } );

    return { attach, validateField };
} )();

/**
 * AJAX Form Handler — Axios
 * Submits forms via axios, handles errors without page reload
 */

const FormHandler = {
    /**
     * Submit form via Axios
     * @param {HTMLFormElement} form - The form element
     * @param {Object} options - Configuration
     */
    async submit ( form, options = {} ) {
        const {
            onSuccess = () => { },
            onError = () => { },
            onValidationError = () => { },
        } = options;

        const formData = new FormData( form );
        const data = Object.fromEntries( formData.entries() );

        // Frontend validation first
        if ( window.AuthValidator ) {
            const validation = AuthValidator.validateForm( data );
            if ( !validation.isValid ) {
                onValidationError( validation.errors );
                return { success: false, errors: validation.errors };
            }
        }

        try {
            const response = await axios( {
                method: form.method || "post",
                url: form.action,
                data: data,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                // Axios automatically parses JSON and handles CSRF for same-origin
            } );

            // Axios 2xx responses come here
            onSuccess( response.data );
            return { success: true, data: response.data };

        } catch ( error ) {
            // Axios wraps errors in error.response
            if ( error.response ) {
                // Server responded with error status (4xx, 5xx)
                const { status, data } = error.response;

                if ( status === 422 || status === 409 ) {
                    // Validation or conflict error
                    onValidationError( data.errors || [ { message: data.message } ] );
                    return { success: false, errors: data.errors };
                }

                // Other server errors
                onError( new Error( data.message || "Server error" ) );
                return { success: false, error: data.message };

            } else if ( error.request ) {
                // Request made but no response (network error)
                onError( new Error( "Network error. Please check your connection." ) );
                return { success: false, error: "Network error" };

            } else {
                // Something else happened
                onError( error );
                return { success: false, error: error.message };
            }
        }
    },

    /**
     * Display errors in form
     * @param {HTMLElement} form - Form element
     * @param {Array} errors - Array of {field, message}
     */
    displayErrors ( form, errors ) {
        // Clear previous errors
        form.querySelectorAll( ".is-invalid" ).forEach( ( el ) => {
            el.classList.remove( "is-invalid" );
        } );
        form.querySelectorAll( ".invalid-feedback" ).forEach( ( el ) => el.remove() );

        // Show new errors
        errors.forEach( ( { field, message } ) => {
            const input = form.querySelector( `[name="${ field }"]` );
            if ( input ) {
                input.classList.add( "is-invalid" );

                const feedback = document.createElement( "div" );
                feedback.className = "invalid-feedback";
                feedback.textContent = message;
                input.parentNode.appendChild( feedback );
            }
        } );
    },

    /**
     * Clear all errors
     * @param {HTMLElement} form 
     */
    clearErrors ( form ) {
        form.querySelectorAll( ".is-invalid" ).forEach( ( el ) => {
            el.classList.remove( "is-invalid" );
        } );
        form.querySelectorAll( ".invalid-feedback" ).forEach( ( el ) => el.remove() );
    },

    /**
     * Show success message
     * @param {HTMLElement} container 
     * @param {string} message 
     */
    showSuccess ( container, message ) {
        container.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        ${ message }
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    },

    /**
     * Show error message
     * @param {HTMLElement} container 
     * @param {string} message 
     */
    showError ( container, message ) {
        container.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${ message }
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    },
};

// Initialize sign-up form
document.addEventListener( "DOMContentLoaded", () => {
    const messagesContainer = document.getElementById( "form-messages" );

    FormValidator.attach( "signUpForm", {
        onSubmit: async ( form ) => {
            await FormSubmitter.submit( form, {
                onSuccess: ( data ) => {
                    messagesContainer.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show">
              ${ data.message || "Success!" }
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
          `;
                    setTimeout( () => {
                        window.location.href = data.redirectUrl || "/sign-in";
                    }, 2000 );
                },
                onError: ( msg ) => {
                    messagesContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show">
              ${ msg }
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
          `;
                },
            } );
        },
    } );
} );