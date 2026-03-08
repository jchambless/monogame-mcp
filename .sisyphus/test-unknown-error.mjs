import { diagnoseError } from '../src/utils/error-diagnosis.js';

console.log('Testing unknown error returns null...\n');

const unknownError = 'This is some completely random error that does not match any pattern xyz123 foo bar baz';

console.log(`Input error: "${unknownError}"\n`);

const diagnosis = diagnoseError(unknownError);

console.log('Result:', diagnosis);

if (diagnosis === null) {
  console.log('\n✓ SUCCESS: Unknown error correctly returned null (not exception)');
  process.exit(0);
} else {
  console.log('\n✗ FAILURE: Unknown error should return null but returned:', diagnosis);
  process.exit(1);
}
