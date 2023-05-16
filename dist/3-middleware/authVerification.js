export const authVerification = (role) => {
    return (req, res, next) => {
        //check if condition is good
        //if not logged in
        if (req.session.authorize !== true)
            return res.status(401).json({ message: "You are not logged in!" });
        //if role is forbidden
        if (role && req.session.user.role !== role) {
            return res.status(403).json({ message: "This action is forbidden!" });
        }
        console.log("verifing");
        next();
    };
};
