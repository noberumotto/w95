module.exports = function (source, map) {
    this.callback(null, `
       export default{
           src:"${source}" 
       }`, map)
}