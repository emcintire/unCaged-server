// Password regex: at least 8 characters, 1 digit, 1 lowercase, 1 uppercase
export const passwordRegex = /^.*(?=.{8,})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/;
