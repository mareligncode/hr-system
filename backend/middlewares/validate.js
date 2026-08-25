/**
 *
 * @param {import('joi').ObjectSchema} schema  - Joi schema to validate against
 * @param {'body'|'query'|'params'} source     - which part of req to validate (default: 'body')
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,       // return ALL errors, not just the first
            allowUnknown: false,     // reject unknown keys
            stripUnknown: true,      // remove unknown keys from the validated value
        });

        if (error) {
            const errors = error.details.map((d) => ({
                field: d.path.join('.'),
                message: d.message.replace(/['"]/g, ''),
            }));

            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }

        // Replace req[source] with the sanitized/coerced value from Joi
        req[source] = value;
        next();
    };
};

/**
 * Convenience wrapper for validating query params.
 */
export const validateQuery = (schema) => validate(schema, 'query');

/**
 * Convenience wrapper for validating route params.
 */
export const validateParams = (schema) => validate(schema, 'params');
