/**
 * Sign-up Page JavaScript — Axios
 * Handles form validation and AJAX submission
 */

document.addEventListener( "DOMContentLoaded", () => {
  const form = document.getElementById( "signup-form" );
  if ( !form ) return;

  const messagesContainer = document.getElementById( "form-messages" );

  // Real-time validation on blur
  form.querySelectorAll( "input" ).forEach( ( input ) => {
    input.addEventListener( "blur", () => {
      const formData = getFormData( form );
      const error = AuthValidator.validateField( input.name, input.value, formData );
      if ( error ) {
        showFieldError( input, error );
      } else {
        clearFieldError( input );
      }
    } );

    // Clear error on input
    input.addEventListener( "input", () => {
      clearFieldError( input );
    } );
  } );

  // Form submission with Axios
  form.addEventListener( "submit", async ( e ) => {
    e.preventDefault();
    FormHandler.clearErrors( form );
    messagesContainer.innerHTML = "";

    // Show loading state
    const submitBtn = form.querySelector( 'button[type="submit"]' );
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creating...';

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

    // Restore button state
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  } );
} );

function showFieldError ( input, message ) {
  input.classList.add( "is-invalid" );
  let feedback = input.parentNode.querySelector( ".invalid-feedback" );
  if ( !feedback ) {
    feedback = document.createElement( "div" );
    feedback.className = "invalid-feedback";
    input.parentNode.appendChild( feedback );
  }
  feedback.textContent = message;
}

function clearFieldError ( input ) {
  input.classList.remove( "is-invalid" );
  const feedback = input.parentNode.querySelector( ".invalid-feedback" );
  if ( feedback ) feedback.remove();
}