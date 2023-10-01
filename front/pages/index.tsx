import type { NextPage } from 'next';
import { AxiosError, AxiosResponse } from 'axios';
import { ChangeEvent, useState } from 'react';
import { RequiredMark } from '../components/RequiredMark';
import { axiosApi } from '../lib/axios';
import { useRouter } from 'next/router';
import { useUserState } from '../atoms/userAtom';

// POSTデータの型
type LoginForm = {
  email: string;
  password: string;
};

type ApiErrorResponse = {
  errors: {
    email: string[];
    password: string[];
    loginFailed: string[];
  };
};

// バリデーションメッセージの型
type Validation = LoginForm & { loginFailed: string };

const Home: NextPage = () => {
  const router = useRouter();
  const { setUser } = useUserState();

  // state定義
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const initialValidationValues = {
    email: '',
    password: '',
    loginFailed: '',
  };
  const [validation, setValidation] = useState<Validation>(initialValidationValues);

  // 追加
  // POSTデータの更新
  const updateLoginForm = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const login = () => {
    setValidation(initialValidationValues);

    axiosApi
      // CSRF保護の初期化
      .get('/sanctum/csrf-cookie')
      .then((res) => {
        // ログイン処理
        axiosApi
          .post('/login', loginForm)
          .then((response: AxiosResponse) => {
            setUser(response.data.data);
            router.push('/memos');
          })
          .catch((err: AxiosError<ApiErrorResponse>) => {
            if (err.response?.status === 422) {
              const errors = err.response?.data.errors;
              const validationMessages: { [index: string]: string } = {};
              Object.keys(errors).map((key: string) => {
                if (key === 'email' || key === 'password' || key === 'loginFailed') {
                  validationMessages[key] = errors[key][0];
                }
              });
              setValidation({ ...initialValidationValues, ...validationMessages });
            }
            if (err.response?.status === 500) {
              alert('システムエラーです！！');
            }
          });
      });
  };

  return (
    <div className='w-2/3 mx-auto py-24'>
      <div className='w-1/2 mx-auto border-2 px-12 py-16 rounded-2xl'>
        <h3 className='mb-10 text-2xl text-center'>ログイン</h3>
        <div className='mb-5'>
          <div className='flex justify-start my-2'>
            <p>メールアドレス</p>
            <RequiredMark />
          </div>
          <input
            className='p-2 border rounded-md w-full outline-none'
            name='email'
            onChange={updateLoginForm}
          />
          {validation.email && (
            <p className='py-3 text-red-500'>{validation.email}</p>
          )}
        </div>
        <div className='mb-5'>
          <div className='flex justify-start my-2'>
            <p>パスワード</p>
            <RequiredMark />
          </div>
          <small className='mb-2 text-gray-500 block'>
            8文字以上の半角英数字で入力してください
          </small>
          <input
            className='p-2 border rounded-md w-full outline-none'
            name='password'
            type='password'
            onChange={updateLoginForm}
          />
          {validation.password && (
            <p className='py-3 text-red-500'>
              {validation.password}
            </p>
          )}
        </div>
        <div className='text-center mt-12'>
          {validation.loginFailed && (
            <p className='py-3 text-red-500'>
              {validation.loginFailed}
            </p>
          )}
          <button
            className='bg-gray-700 text-gray-50 py-3 sm:px-20 px-10 rounded-xl cursor-pointer drop-shadow-md hover:bg-gray-600'
            onClick={login}
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
