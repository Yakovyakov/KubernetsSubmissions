function generateUUID() {
  return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const randomHash = generateUUID();


const printHash = () => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomHash}`);

  setTimeout(printHash, 5000)
}

printHash()