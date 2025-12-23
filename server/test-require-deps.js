try {
  require('google-auth-library');
  console.log('google-auth-library found');
  require('bcrypt');
  console.log('bcrypt found');
  require('uuid');
  console.log('uuid found');
} catch (e) {
  console.error(e);
}
