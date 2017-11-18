const request = require('request-promise');

// const mitm = require('mitm')();
// mitm.on("request", function(req, res) {
//   res.statusCode = 402;
//   res.end();
// })


const URLS = {
  validators: {
    html: 'https://validator.nu',
    css: 'https://jigsaw.w3.org/css-validator/validator'
  },
  target: process.argv[2]
}

// Basic error handling
// 1. No parameter
if(!URLS.target) {
  throw new Error('URL should be specified as a first parameter!');
}

// 2. Site exists
(() => {
  const options = {
    url: URLS.target,
    resolveWithFullResponse: true
  }

  request(options)
      .then(response => response.statusCode)
      .then(code => {
        console.log(`Status code of connection to ${URLS.target}: ${code}`);
      })
      .catch(err => {
        throw new Error(err);
      });

})();

// ===============================================
// 1. Html validator
(() => {
  const blacklist = ['A document must not include both a “meta” element with an “http-equiv” attribute whose value is “content-type”, and a “meta” element with a “charset” attribute.'];
  const options = {
    url: `${URLS.validators.html}?doc=${URLS.target}&out=json`,
    headers: {
      'User-Agent': 'wwwalidator'
    }
  }

  request(options)
  .then(body => JSON.parse(body).messages)
  .then(messages => messages.map(msg => `> ${msg.message}\n[${msg.extract}]\n`))
  .then(messages => console.log('HTML VALIDATION:\n', ...messages))
  .catch(err => {
    console.log(err.name, err.error.code, err.message);
  });
})();

// 2. Css validator
(() => {
  const options = {
    url: `${URLS.validators.css}?uri=${URLS.target}&output=json&warning=0`,
    headers: {
      'User-Agent': 'wwwalidator'
    }
  }

  request(options)
  .then(body => JSON.parse(body).cssvalidation)
  .then(json => json.validity ? ' 😀  All good m8' : json.errors)
  .then(final => {
    console.log('\nCSS VALIDITY:');
    if(Array.isArray(final)) {
      console.log(...final.map(error => `${error.line}: ${error.message}\n`))
    } else {
      console.log(final);
    }
  })
  .catch(err => {
    console.log(err.name, err.error.code, err.message);
  });
})();
