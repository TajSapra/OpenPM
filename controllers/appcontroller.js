const pool=require('../config/postgres')
const login_checker=require('./services/login_checker')
const idgen=require('./services/Generate_ids')
project_list=function(req, res){
    var option=login_checker(req)
    if(option!=2){
        return res.redirect('/logout')
    }
    var query='Select * from users where mail=$1'
    var user_email=req.cookies.User_email
    pool.query(query, [user_email]).then(results=>{
        // if(results.rowCount==0)return res.redirect('./logout')
        var user=results.rows[0];
        var project_list=[]
        for(let i=0;i<user.projects.length;i++){
            var curr=user.projects[i];
            var list=curr.split(', ')
            var current_object={}
            for(var j=0;j<list.length;j++){
                var data123=list[j].split(':')                
                for(let k=1;k<data123.length;k++){
                    if(current_object[data123[0]]==undefined){
                        current_object[data123[0]]=data123[k]
                    }
                    else
                    current_object[data123[0]]+=data123[k]
                }
            }
            project_list.push(current_object)
        }
        user["projects"]=project_list
        // console.log(user)
        return res.render('Project_list', {
            title:"Project Lists",
            user:user,
            login:true
        })
    })
}
createnewproject=function(req,res){
    try{
        var option=login_checker(req)
        if(option!=2){
            return res.redirect('/logout')
        }
        var project_name=req.body.project_name
        var user=req.cookies.User_email
        var project_desc=req.body.project_description
        var project_id=idgen(project_name, user)
        // task 2- add project details in user table
        var time=Date()
        var data=[project_name, project_id, user, time, project_desc]
        console.log(data)
        var query='Insert into projects(project_name, project_id, project_owner, starting_time, project_desc) values($1, $2, $3, $4, $5)'
        pool.query(query, data).then(results=>{
            var data2=["Name:"+project_name+", ID:"+project_id+", Owner:"+user+", Time:"+time, user]
            var query2="Update users set projects = ARRAY_APPEND(projects, $1) where mail=$2"
            pool.query(query2, data2).then(results2=>{
                res.json({success : "Updated Successfully", status : 200, disp_data:{"Name":project_name, "Date":time, "ID":project_id}})
            })
        })
    }
    catch(err){
        res.json({message:'Error in the action. Please try after some time'})
    }
}
getproject_details= function(req, res){
    var option=login_checker(req)
    if(option!=2){
        res.json({error:"Please Log in"})
    }
    else{
        pool.query('Select * from projects where project_id = $1', [req.body.Project_id]).then(results=>{
            if(results.rowCount==0){
                res.json({error:"No Project Found"})
            }
            else{
                res.json({success : "Updated Successfully", status : 200, project_details:results.rows[0]})
            }
        })
    }
}
viewproject=function(req,res){
    var option=login_checker(req)
    if(option!=2){
        return res.redirect('./logout')
    }
    pool.query('Select * from users where mail=$1',[req.cookies.User_email]).then(results=>{
        pool.query('Select * from projects where project_id=$1', [req.params.id]).then(results2=>{
            console.log(results2.rows[0])
            return res.render('viewproject', {
                user:results.rows[0],
                project:results2.rows[0],
                title:'View Project',
                login:true
            })
        })
    })
}
createnewtask=function(req,res){
    var option=login_checker(req)
    if(option!=2){
        res.json({error:"Please Log in"})
    }
    else{
        try{
            var time=new Date().getTime().toString()        
            var task_id=idgen(req.body.description)
            var task_desc=req.body.description
            var task_name=req.body.task_name
            var deadline=req.body.deadline
            var project=req.body.project
            var creation=time
            pool.query('Insert Into tasks(task_id, task_description, deadline,project, created_on, task_name)', [task_id, task_desc, deadline, project, creation, task_name]).then(results=>{
                pool.query("update projects set assigned_tasks=ARRAY_APPEND(assigned_tasks, $1) where project_name=$2", []).then(results2=>{
                    res.json({success : "Updated Successfully", status : 200, disp_data:{Name:task_name, Deadline:deadline}})
                })
            })
        }
        catch(err){
            res.json({message:'Error in the action. Please try after some time'})
        }
    }
}
module.exports={project_list, createnewproject,getproject_details, viewproject}