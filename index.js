const axios = require('axios').default
//Source with little modifications: https://docs.google.com/spreadsheets/d/1avMaSsZ5h7u21LpRz04kk6cn-PPHucA95T745Jj21MM/edit#gid=0
const impossibleMaps = require('./impossible_vnl_maps.json')

fs = require('fs')

const impossible_vnl_filters = []
let mapsFound = 0

Promise.all([
  axios.get('https://kztimerglobal.com/api/v2.0/maps?is_validated=true&limit=9999'),
  axios.get('https://kztimerglobal.com/api/v2.0/record_filters?stages=0&mode_ids=202&limit=9999')
])
  .then(results => {
    const global_maps = results[0].data
    const filters = results[1].data

    for (i = 0; i < impossibleMaps.length; i++) {

      const mapFound = global_maps.find(global_map => {
        return (impossibleMaps[i].map_name === global_map.name)
      })

      if (mapFound) {
        let filterFound = false
        for (j = 0; j < filters.length; j++) {
          if (filters[j].map_id === mapFound.id) {
            impossible_vnl_filters.push(filters[j])
            filterFound = true
          }
        }
        if (filterFound) {
          mapsFound ++
        }
      } else {
        //A map in Nuke's list is either not global or wrongly written
        console.log (`${impossibleMaps[i].map_name} isn't global.`)
      }
    }
    fs.writeFile('impossible_vnl_filters.json', JSON.stringify(impossible_vnl_filters), function (err) {
      if (err) return console.log(err)
      let filtersCountString = `\x1b[36m${impossible_vnl_filters.length}\x1b[0m`
      let mapsCountString = `\x1b[36m${mapsFound}\x1b[0m`
      console.log(`Found ${filtersCountString} impossible vanilla filters from ${mapsCountString} maps total.`)
    });
})