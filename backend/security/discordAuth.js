const passport = require("passport");
const { Strategy } = require("passport-discord").Strategy;

const discordHandler = passport.use(
  //not implemented yet!
  new Strategy(
    {
      clientID: "id",
      clientSecret: "secret",
      callbackURL: "callbackURL",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

module.exports = discordHandler;