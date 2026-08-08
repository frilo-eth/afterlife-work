import { createHash } from 'node:crypto'

const password = process.argv[2]

if (!password) {
  console.error('Please provide a password as an argument')
  process.exit(1)
}

const hashedPassword = createHash('sha256')
  .update(password)
  .digest('hex')

console.log('Your hashed password is:')
console.log(hashedPassword)
console.log('\nAdd this to your .env file as ADMIN_PASSWORD=<hashed-password>') 