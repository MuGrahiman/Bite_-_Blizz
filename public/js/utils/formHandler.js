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