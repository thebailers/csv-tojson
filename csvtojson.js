/*
run: node csvtojson "BCD Lookups - Currency.csv" CurrencyCode=label Name=value  
*/

const fs = require('fs')
const { compose, map, head, dropLast, split, join, concat, fromPairs, indexOf } = require('ramda')

const options = process.argv.slice(2)
const filePath = options[0]
const columns = options.slice(1)

const generateFileName = (filePath) => concat(compose(join('-'), dropLast(1), split(/[\s-.]+/))(filePath), '.json')

const generateJSON = (callback) => {
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    
  const dataSplit = data.split('\r\n')
  const header = dataSplit[0].split(',')
  const body = dataSplit.slice(1).map(e => e.split(/,"|",|,(?=\S)/g)) // Ensure we split only on commars surrounded by non-whitespace characters. Some country names have a comma
        
  // return the names of the columns we want to target - user provided via args
  const targetColumns = compose(map(compose(head, split('='))))(columns)
  
  const newColumnValuesObj = compose(fromPairs, map(split('=')))(columns)
        
  // index locations of target columns in csv header array
  const targetColumnIndexes = targetColumns.map(h => {
    if (header.indexOf(h) == -1) {
      throw new Error(`Target Column Name not found in CSV header column: ${h}`)
    }
    return header.indexOf(h)
  })

  const targetColumnIndexes2 = map(h => indexOf(h, header))(targetColumns)


  //    indexOf :: a -> Array a -> Maybe NonNegativeInteger
const indexOf = x => xs => S.filter (S.gte (0)) (S.Just (xs.indexOf (x)));
  

  const renamedColumnHeaders = header
    .filter(h => targetColumns.indexOf(h) != -1) // return only the columns specified
    .map((h, i) => {
      return newColumnValuesObj[h]
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
  fs.writeFile(generateFileName(filePath), content, (err) => {
    if (err) throw err
  
    console.log('The file has been saved successfully.')
  })
})
