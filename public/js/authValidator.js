/**
 * Auth Validators — Frontend (no dependencies, vanilla JS)
 * Mirrors backend Joi rules for instant feedback
 */

const AuthValidator = {
    // Validation rule engine
    rules: {
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
    },
     // Field configurations
     fieldConfigs : {
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