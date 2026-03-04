import { useState } from "react";
import type { UserRegister } from "../Types";
import { userRegister } from "../lib/api.auth";

const Register: React.FC = () => {
  const [formData, setFormData] = useState<UserRegister>({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await userRegister(formData);
      if (response.statusCode !== 201) {
        throw new Error("Registration failed");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };


  return(
    <div>
        <form onSubmit={handleSubmit}>

            <div>
                <label htmlFor="fullName">Full Name</label>
                <input 
                type="text" 
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                />
            </div>
            <div>
                <label htmlFor="username">Username</label>
                <input 
                type="text" 
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                />
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <input 
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input 
                type="password" 
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                />
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>
            }
            <button type="submit" disabled={loading}>
                {
                    loading ? "Registering...." : "Register"
                }
            </button>
        </form>
    </div>
  )
};


export default Register;