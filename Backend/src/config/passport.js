import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";
import config from "./config.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        // only trust Google emails that Google itself has verified
        if (!email || !profile._json.email_verified) return done(null, false);

        let user = await userModel.findOne({ $or: [{ googleId: profile.id }, { email }] });

        if (!user) {
          const base = (profile.displayName || email.split("@")[0]).replace(/\s+/g, "").toLowerCase();
          user = await userModel.create({
            googleId: profile.id,
            email,
            username: `${base}${Math.floor(1000 + Math.random() * 9000)}`,
            verified: true,
          });
        } else if (!user.googleId) {
            // existing email/password account: link it to Google
            if (!user.verified) {
                user.password = undefined;   // drop any password set by an unverified sign-up
            }
            user.googleId = profile.id;
            user.verified = true;
            await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;