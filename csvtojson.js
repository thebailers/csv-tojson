/*
run: node csvtojson "BCD Lookups - Currency.csv" CurrencyCode=label Name=value  
*/

const fs = require('fs')

const options = process.argv.slice(2)
const filePath = options[0]
const columns = options.slice(1)

function generateFileName(filePath) {
  return filePath
    .split(/[\s-.]+/)
    .slice(0, -1)
    .join('-')
}

const generateJSON = (callback) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    
  const dataSplit = data.split('\r\n')
  const header = dataSplit[0].split(',')
  const body = dataSplit.slice(1).map(e => e.split(/,"|",|,(?=\S)/g)) // Ensure we split only on commars surrounded by non-whitespace characters. Some country names have a comma
        
  // return the names of the columns we want to target - user provided via args
  const targetColumns = columns.map(col => col.split('=')[0])
  
  const newColumnValuesObj = columns.map(column => ({
    [column.split('=')[0]]: column.split('=')[1]
  }))
        
  // index locations of target columns in csv header array
  const targetColumnIndexes = targetColumns.map(h => {
    if (header.indexOf(h) == -1) {
      throw new Error(`Target Column Name not found in CSV header column: ${h}`)
    }
    return header.indexOf(h)
  })

  const renamedColumnHeaders = header
    .filter(h => targetColumns.indexOf(h) != -1) // return only the columns specified
    .map((h, i) => {
      return newColumnValuesObj[i][h]
    }) // map to new column names

    // transform the body
    const transformedBody = body
      .map(c => c.filter((el, i) => targetColumnIndexes.indexOf(i) != -1))
        
    const output = JSON.stringify(transformedBody.map((a, i) => {
      const objToReturn = {}
      a.map((b, i) => objToReturn[renamedColumnHeaders[i]] = b)
      return objToReturn      
    }))

    callback(err, output)
  })
}

generateJSON(function(err, content){ 
  if (err) return err
  fs.writeFile(generateFileName(filePath) + '.json', content, (err) => {
    if (err) throw err
  
    console.log('The file has been saved successfully.')
  })
})
