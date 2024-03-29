import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import { useNavigate, Link } from "react-router-dom";
import { BiSolidShow } from "react-icons/bi";
import { notification } from "antd";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [validationError, setValidationError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();
  const register = () => {
    Navigate("/Register");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setValidationError("Нэвтрэх нэр эсвэл нууц үг хоосон байна!");
      return;
    }

    setLoading(true);
    const login = async (email, password) => {
      const apiUrl = `${process.env.REACT_APP_BASE_URL}/login`;
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.status === 200) {
          const data = await response.json();
          const { token } = data;
          const { role } = data;
          const { name } = data;
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
          localStorage.setItem("name", name);
          notification.success({
            message: "Амжилттай нэвтэрлээ.",
          });
          Navigate("/");
        } else if (response.status === 401) {
          notification.error({
            message: "Нууц үг буруу байна.!!!",
          });
        } else if (response.status === 404) {
          notification.error({
            message: "Мэйл хаяг буруу байна.!!!",
          });
        }
      } catch (error) {
        console.error("Login Failed", error);
        notification.error({
          message: "Нэвтэрч чадсангүй",
        });
      } finally {
        setLoading(false);
      }
    };

    await login(email, password);
  };
  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  return (
    <section className={css.loginSection}>
      <div className={css.formBox}>
        <div className={css.formValue}>
          <form className="form" onSubmit={handleSubmit}>
            <h2>
              <strong>Нэвтрэх</strong>
            </h2>
            <p className={css.result}>{validationError}</p>
            <br />
            <div className={css.inputBox}>
              <input
                type="text"
                className="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>
                <p>Нэвтрэх нэр</p>
              </label>
            </div>
            <div className={css.inputBox}>
              <input
                type={passwordVisibility ? "text" : "password"}
                className="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>
                <p>Нууц үг</p>
              </label>
              <BiSolidShow
                type="button"
                onClick={() => setPasswordVisibility(!passwordVisibility)}
              />
              {passwordVisibility ? "Hide" : "Show"}
            </div>
            <div className={css.forget}>
              <label className={css.rememberMe}>
                <p>Сануулах</p>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
              </label>
              <label>
                <Link to={`/ForgetPassword`}>
                  <p>Нууц үг мартсан</p>
                </Link>
              </label>
            </div>
            <div className={css.buttonContainer}>
              <button className={css.button} type="submit">
                <p>Нэвтрэх</p>
              </button>
              <br></br>
              <button className={css.button} onClick={register}>
                <p>Бүртгүүлэх</p>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
