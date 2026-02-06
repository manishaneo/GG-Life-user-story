export const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

export const emailRegex =
  /^(?!\.)(?!.*\.\.)[a-zA-Z]+(?:\.[a-zA-Z]+)*@[a-zA-Z]+(?:\.[a-zA-Z]+)*\.[a-zA-Z]{2,}$/;
export const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
