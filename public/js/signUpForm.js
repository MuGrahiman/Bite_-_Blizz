
/**
 * ============================================================
 * SIGN-UP FORM MODULE — Real-Time Validation (Fixed)
 * ============================================================
 */

const BASE_URL = 'http://localhost:3000/';

const SignUpForm = ( () => {
  // ============================================================
  // SECTION 1: CONFIGURATION
  // ============================================================

  const RULES = {
    required: ( value ) => value.trim() !== "" || "This field is required",
    minLength: ( value, min ) => value.length >= min || `Must be at least ${ min } characters`,
    maxLength: ( value, max ) => value.length <= max || `Cannot exceed ${ max } characters`,
    email: ( value ) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( value ) || "Please enter a valid email",
    passwordStrength: ( value ) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test( value ) ||
      "Must contain uppercase, lowercase, and number",
    match: ( value, targetValue ) => value === targetValue || "Passwords do not match",
  };

  const FIELD_CONFIG = {
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
      { rule: "passwordStrength", msg: "Must contain uppercase, lowercase, and number" },
    ],
    confirmPassword: [
      { rule: "required", msg: "Please confirm your password" },
      {
        rule: "match",
        getArg: () => document.getElementById( "password" )?.value,
        msg: "Passwords do not match",
      },
    ],
  };

  // ============================================================
  // SECTION 2: VALIDATOR
  // ============================================================

  function validateField ( fieldName, value ) {
    const configs = FIELD_CONFIG[ fieldName ];
    if ( !configs ) return "";

    for ( const config of configs ) {
      const arg = typeof config.getArg === "function" ? config.getArg() : config.arg;
      const validatorFn = RULES[ config.rule ];
      if ( !validatorFn ) continue;
      const result = validatorFn( value, arg );
      if ( result !== true ) return config.msg || result;
    }
    return "";
  }

  function validateForm ( formData ) {
    const errors = {};
    for ( const fieldName of Object.keys( FIELD_CONFIG ) ) {
      const error = validateField( fieldName, formData[ fieldName ] || "" );
      if ( error ) errors[ fieldName ] = error;
    }
    return { isValid: Object.keys( errors ).length === 0, errors };
  }

  // ============================================================
  // SECTION 3: UI UPDATES
  // ============================================================

  function getErrorElement ( input ) {
    if ( !input ) return null;
    const elementId = `${ input.id }Error`;
    let feedback = document.getElementById( elementId );
    if ( !feedback ) {
      feedback = document.createElement( "small" );
      feedback.className = "invalid-feedback d-block";
      feedback.id = elementId;
      input.parentNode.appendChild( feedback );
    }
    return feedback;
  }

  function setFieldState ( input, error ) {
    if ( !input ) return;
    const feedback = getErrorElement( input );
    if ( !feedback ) return;

    if ( error ) {
      input.classList.add( "is-invalid" );
      input.classList.remove( "is-valid" );
      feedback.textContent = error;
    } else {
      input.classList.remove( "is-invalid" );
      feedback.textContent = "";
      if ( input.value.trim() !== "" ) {
        input.classList.add( "is-valid" );
      } else {
        input.classList.remove( "is-valid" );
      }
    }
  }

  function clearFieldState ( input ) {
    if ( !input ) return;
    input.classList.remove( "is-invalid", "is-valid" );
    const feedback = getErrorElement( input );
    if ( feedback ) feedback.textContent = "";
  }

  function clearAllErrors ( form ) {
    form.querySelectorAll( ".is-invalid, .is-valid" ).forEach( ( el ) => {
      el.classList.remove( "is-invalid", "is-valid" );
    } );
    form.querySelectorAll( ".invalid-feedback" ).forEach( ( el ) => {
      el.textContent = "";
    } );
  }

  function showAlert ( container, message, type = "success" ) {
    if ( !container ) return;
    container.innerHTML = `
      <div class="alert alert-${ type } alert-dismissible fade show" role="alert">
        ${ message }
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  function clearAlerts ( container ) {
    if ( container ) container.innerHTML = "";
  }

  function setLoading ( button, isLoading ) {
    if ( !button ) return;
    if ( isLoading ) {
      button.dataset.originalText = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...`;
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || "Create Account";
    }
  }

  // ============================================================
  // SECTION 4: API CALLS
  // ============================================================

  async function submitForm ( form ) {
    const formData = new FormData( form );
    const payload = Object.fromEntries( formData.entries() );
    const response = await fetch( form.action, {
      method: 'post',
      body: JSON.stringify( payload ),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    } );
    return response.json();
  }

  // ============================================================
  // SECTION 5: CONTROLLER
  // ============================================================

  function attach ( formId ) {

    const form = document.getElementById( formId );
    if ( !form ) {
      console.warn( `SignUpForm: Form #${ formId } not found` );
      return;
    }

    const messagesContainer = document.getElementById( "form-messages" );
    const submitButton = form.querySelector( 'button[type="submit"]' );

    // --- REAL-TIME: Validate on EVERY keystroke ---
    form.querySelectorAll( "input" ).forEach( ( input ) => {
      input.addEventListener( "input", () => {
        const error = validateField( input.name, input.value );
        setFieldState( input, error );

        // Cross-field: if password changes, re-validate confirmPassword
        if ( input.name === "password" ) {
          const confirmInput = form.querySelector( '[name="confirmPassword"]' );
          if ( confirmInput && confirmInput.value ) {
            const confirmError = validateField( "confirmPassword", confirmInput.value );
            setFieldState( confirmInput, confirmError );
          }
        }
      } );
    } );

    // --- BLUR: Validate on blur ---
    form.querySelectorAll( "input" ).forEach( ( input ) => {
      input.addEventListener( "blur", () => {
        const error = validateField( input.name, input.value );
        setFieldState( input, error );
      } );
    } );

    // --- FORM SUBMISSION ---
    form.addEventListener( "submit", async ( event ) => {
      event.preventDefault();
      // clearAlerts( messagesContainer );  
      // clearAllErrors( form );            

      const formData = Object.fromEntries( new FormData( form ).entries() );
      const validation = validateForm( formData );

      if ( !validation.isValid ) {
        for ( const [ fieldName, message ] of Object.entries( validation.errors ) ) {
          const input = form.querySelector( `[name="${ fieldName }"]` );
          setFieldState( input, message );
        }
        const firstInvalid = form.querySelector( ".is-invalid" );
        firstInvalid?.focus();
        return;
      }

      // setLoading( submitButton, true );

      try {
        const data = await submitForm( form );
        showAlert( messagesContainer, data.message || "Registration successful!", "success" );
        form.reset();
        clearAllErrors( form );

        setTimeout( () => {
          window.location.href = data.redirectUrl || "/mail-confirmation";
        }, 2000 );

      } catch ( error ) {
        if ( error.response ) {
          const { status, data } = error.response;

          if ( status === 422 || status === 409 ) {
            const errors = data.errors || [];

            if ( Array.isArray( errors ) && errors.length > 0 ) {
              errors.forEach( ( { field, message } ) => {
                const input = form.querySelector( `[name="${ field }"]` );
                setFieldState( input, message || "Invalid" );
              } );
            } else if ( typeof errors === "object" && errors !== null ) {
              for ( const [ fieldName, message ] of Object.entries( errors ) ) {
                const input = form.querySelector( `[name="${ fieldName }"]` );
                setFieldState( input, message );
              };
            } else {
              showAlert( messagesContainer, data.message || "Validation failed", "danger" );
            }

            const firstInvalid = form.querySelector( ".is-invalid" );
            firstInvalid?.focus();

          } else {
            showAlert( messagesContainer, data.message || "Something went wrong. Please try again.", "danger" );
          }

        } else if ( error.request ) {
          showAlert( messagesContainer, "Network error. Please check your connection and try again.", "danger" );
        } else {
          showAlert( messagesContainer, error.message || "An unexpected error occurred.", "danger" );
        }

      } finally {
        // setLoading( submitButton, false );
      }
    } );
  }

  return { attach, validateField, validateForm };
} )();

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener( "DOMContentLoaded", () => {
  SignUpForm.attach( "signUpForm" );
} );