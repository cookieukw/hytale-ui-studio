const fs = require('fs');

// We just want to see the JSON
const jsonFile = fs.readFileSync('src/main/resources/Common/UI/Custom/Template/RPGInventory.ui', 'utf-8');

// I will parse it using a quick regex just to check the values
const rows = jsonFile.split('\n');
for (let i = 0; i < rows.length; i++) {
  if (rows[i].includes('Anchor')) {
    // console.log(`Line ${i+1}: ${rows[i]}`);
  }
}
