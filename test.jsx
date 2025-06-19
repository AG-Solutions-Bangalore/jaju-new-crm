import Cookies from "js-cookie";

// Cookie options
const cookieOptions = {
  expires: 7,              // expires in 7 days
  secure: true,            // send only over HTTPS
  sameSite: "Strict",      // prevent CSRF
};

// Set cookies with options
Cookies.set("token", UserInfo.token, cookieOptions);
Cookies.set("id", UserInfo.user.id, cookieOptions);
Cookies.set("name", UserInfo.user.name, cookieOptions);
Cookies.set("userType", UserInfo.user.user_type_id, cookieOptions);
Cookies.set("email", UserInfo.user.email, cookieOptions);



import Cookies from "js-cookie";

const isProduction = window.location.protocol === "https:";

const cookieOptionsDD = {
  expires: 7,
  secure: isProduction,       // Only true on HTTPS
  sameSite: "Strict",
};

Cookies.set("token", UserInfo.token, cookieOptions);
Cookies.set("id", UserInfo.user.id, cookieOptions);
Cookies.set("name", UserInfo.user.name, cookieOptions);
Cookies.set("userType", UserInfo.user.user_type_id, cookieOptions);
Cookies.set("email", UserInfo.user.email, cookieOptions);
