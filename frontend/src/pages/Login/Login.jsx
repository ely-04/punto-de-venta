import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useRegisterMutation } from '@/features/auth/services/authApi';
import { setCredentials, selectCurrentUser } from '@/features/auth/authSlice';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('cajero');
  const [isRegister, setIsRegister] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading, error: registerError }] = useRegisterMutation();
  
  const loading = isLoginLoading || isRegisterLoading;
  const error = loginError || registerError;

  // Si el usuario ya está autenticado, redirigir al home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!email || !email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email inválido';
    }
    
    if (!password || !password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (isRegister) {
      if (!nombre || !nombre.trim()) {
        errors.nombre = 'El nombre es requerido';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let result;
      if (isRegister) {
        result = await register({ nombre, email, password, rol }).unwrap();
      } else {
        result = await login({ email, password }).unwrap();
      }

      // Verificar que tenemos los datos correctos
      if (result.user && result.token) {
        dispatch(setCredentials({ user: result.user, token: result.token }));
        localStorage.setItem('token', result.token);
        
        // Redirigir al home
        navigate('/');
      } else {
        console.error('Respuesta inválida del servidor:', result);
      }
    } catch (err) {
      console.error('Error en autenticación:', err);
    }
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setValidationErrors({});
    setEmail('');
    setPassword('');
    setNombre('');
  };

  const getErrorMessage = () => {
    if (error?.data?.message) return error.data.message;
    if (error?.data?.errors) {
      return error.data.errors.map(e => e.msg).join(', ');
    }
    if (error?.error) return error.error;
    return 'Error al autenticar';
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isRegister ? 'Crear Cuenta' : 'Sistema POS - Login'}</h1>
        <p className="login-subtitle">
          {isRegister 
            ? 'Registra un nuevo usuario' 
            : 'Inicia sesión como administrador'}
        </p>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {getErrorMessage()}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (validationErrors.nombre) {
                      setValidationErrors({ ...validationErrors, nombre: '' });
                    }
                  }}
                  className={validationErrors.nombre ? 'input-error' : ''}
                />
                {validationErrors.nombre && (
                  <span className="field-error">{validationErrors.nombre}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="rol">Rol</label>
                <select 
                  id="rol"
                  value={rol} 
                  onChange={(e) => setRol(e.target.value)}
                >
                  <option value="cajero">Cajero</option>
                  <option value="admin">Administrador</option>
                  <option value="reportes">Reportes</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors({ ...validationErrors, email: '' });
                }
              }}
              className={validationErrors.email ? 'input-error' : ''}
              disabled={loading}
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors({ ...validationErrors, password: '' });
                }
              }}
              className={validationErrors.password ? 'input-error' : ''}
              disabled={loading}
            />
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {isRegister ? 'Registrando...' : 'Iniciando sesión...'}
              </>
            ) : (
              isRegister ? 'Registrarse' : 'Ingresar'
            )}
          </button>
        </form>

        <div className="toggle-container">
          <p>
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </p>
          <button 
            type="button"
            className="toggle-btn" 
            onClick={handleToggleMode}
            disabled={loading}
          >
            {isRegister ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </div>

        {isRegister && (
          <div className="info-message">
            ℹ️ Selecciona el rol apropiado. Los administradores pueden gestionar usuarios y productos.
          </div>
        )}
      </div>
    </div>
  );
}
