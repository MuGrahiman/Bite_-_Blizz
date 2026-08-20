/**
 * Auth Validators — Frontend (no dependencies, vanilla JS)
 * Mirrors backend Joi rules for instant feedback
 */

const AuthValidator = {
    // Validation rules matching backend Joi schema
    rules: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50,
            message: "Name must be 2-50 characters",
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address",
        },
        password: {
            required: true,
            minLength: 8,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: "Password must be 8+ chars with uppercase, lowercase, and number",
        },
        confirmPassword: {
            required: true,
            matchField: "password",
            message: "Passwords do not match",
        },
    },

    // Validate single field
    validateField ( fieldName, value, formData = {} ) {
        const rule = this.rules[ fieldName ];
        if ( !rule ) return null;

        if ( rule.required && !value.trim() ) {
            return `${ fieldName.charAt( 0 ).toUpperCase() + fieldName.slice( 1 ) } is required`;
        }

        if ( rule.minLength && value.length < rule.minLength ) {
            return rule.message;
        }

        if ( rule.maxLength && value.length > rule.maxLength ) {
            return rule.message;
        }

        if ( rule.pattern && !rule.pattern.test( value ) ) {
            return rule.message;
        }

        if ( rule.matchField && value !== formData[ rule.matchField ] ) {
            return rule.message;
        }

        return null;
    },

    // Validate entire form
    validateForm ( formData ) {
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
    },
};