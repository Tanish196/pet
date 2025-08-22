export const getInitials = (name)=>{
    if (!name) return ""
    const l = name.split(" ")
    let initials = ""

    for(var i = 0; i<Math.min(2, l.length);i++){
        initials+=l[i][0]
    }
    return initials.toUpperCase();
}