
// Helpers
function getFormData ( form ) {
  const data = {};
  form.querySelectorAll( "input" ).forEach( ( input ) => {
    data[ input.name ] = input.value;
  } );
  return data;
}
