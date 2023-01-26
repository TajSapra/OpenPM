const bcrypt=require('bcrypt')
const saltRounds=10
idgen=function(project_name, owner=''){
    const hash=bcrypt.hashSync(project_name+owner, saltRounds)
    return hash
}
module.exports=idgen