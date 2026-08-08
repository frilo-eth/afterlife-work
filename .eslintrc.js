module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react/no-unescaped-entities": "warn",
    "react/display-name": "warn",
    "@next/next/no-img-element": "warn"
  }
}; 