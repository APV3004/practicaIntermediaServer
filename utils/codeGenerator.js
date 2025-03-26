exports.generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Genera un número de 6 dígitos
};