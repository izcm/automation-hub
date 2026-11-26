(() => {
  // <stdin>
  var greeting = "Hello from the IIFE!";
  console.log(greeting);
  function privateHelper() {
    console.log("This is a private function.");
  }
  privateHelper();
})();
