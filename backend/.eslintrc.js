module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    indent: ['error', 2],
    semi: ['error', 'always'],
    'no-unused-vars': 'error',
    quotes: ['error', 'single'],
    'max-len': ['warn', { code: 80 }],
    camelcase: 'error', // Agregando la regla camelcase
    'consistent-return': 'error', // Agregando la regla consistent-return
    'no-console': 'warn', // Agregando la regla no-console
    'no-magic-numbers': ['warn', { 'ignore': [-1, 0, 1, 2] }], // Ignorando números comunes como -1, 0, 1, 2
    'prefer-const': 'error', // Agregando la regla prefer-const

    // Reglas adicionales para mejorar la legibilidad y claridad del código
    'space-before-function-paren': ['error', 'never'], // Espacio antes de paréntesis de función
    'space-in-parens': ['error', 'never'], // Espacios dentro de paréntesis
    'space-infix-ops': 'error', // Espacios alrededor de los operadores
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }], // Máximo de una línea en blanco entre bloques de código
    'comma-spacing': 'error', // Espacios después de las comas
    'eol-last': 'error' // Línea en blanco al final del archivo
  }
};
  
