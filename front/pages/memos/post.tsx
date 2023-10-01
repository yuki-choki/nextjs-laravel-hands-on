import type { NextPage } from 'next';
import { RequiredMark } from '../../components/RequiredMark';
import { useEffect, useState } from 'react';
import { axiosApi } from '../../lib/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

type MemoForm = {
  title: string;
  body: string;
};

type ApiErrorResponse = {
  errors: {
    title: string[];
    body: string[];
  };
};

const Post: NextPage = () => {
  const router = useRouter();
  const { checkLoggedIn } = useAuth();
  const [memoForm, setMemoForm] = useState<MemoForm>({
    title: '',
    body: '',
  });
  const initialValidationValues = {
    title: '',
    body: '',
  };
  const [validation, setValidation] = useState<MemoForm>(initialValidationValues);

useEffect(() => {
  const init = async () => {
    const res = await checkLoggedIn();
    if (!res) {
      router.push('/');
    }
  };
  init();
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMemoForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMemoForm({ ...memoForm, [e.target.name]: e.target.value });
  };

  const createMemo = () => {
    setValidation(initialValidationValues);

    axiosApi
      // CSRF保護の初期化
      .get('/sanctum/csrf-cookie')
      .then((res) => {
        // APIへのリクエスト
        axiosApi
          .post('/api/memos', memoForm)
          .then((response: AxiosResponse) => {
            router.push('/memos');
          })
          .catch((err: AxiosError<ApiErrorResponse>) => {
            if (err.response?.status === 422) {
              const errors = err.response?.data.errors;
              const validationMessages: { [index: string]: string } = {};
              Object.keys(errors).map((key: string) => {
                if (key === 'title' || key === 'body') {
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
    <div className='w-2/3 mx-auto'>
      <div className='w-1/2 mx-auto mt-32 border-2 px-12 py-16 rounded-2xl'>
        <h3 className='mb-10 text-2xl text-center'>メモの登録</h3>
        <div className='mb-5'>
          <div className='flex justify-start my-2'>
            <p>タイトル</p>
            <RequiredMark />
          </div>
          <input
            className='p-2 border rounded-md w-full outline-none'
            name='title'
            value={memoForm.title}
            onChange={updateMemoForm}
          />
          {validation.title && (
            <p className='py-3 text-red-500'>
              {validation.title}
            </p>
          )}
        </div>
        <div className='mb-5'>
          <div className='flex justify-start my-2'>
            <p>メモの内容</p>
            <RequiredMark />
          </div>
          <textarea
            className='p-2 border rounded-md w-full outline-none'
            name='body'
            cols={30}
            rows={4}
            value={memoForm.body}
            onChange={updateMemoForm}
          />
          {validation.body && (
            <p className='py-3 text-red-500'>
              {validation.body}
            </p>
          )}
        </div>
        <div className='text-center'>
          <button
            className='bg-gray-700 text-gray-50 py-3 sm:px-20 px-10 mt-8 rounded-xl cursor-pointer drop-shadow-md hover:bg-gray-600'
            onClick={createMemo}
          >
            登録する
          </button>
        </div>
      </div>
    </div>
  );
};

export default Post;
