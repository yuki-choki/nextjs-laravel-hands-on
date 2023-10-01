import { atom, useRecoilState } from 'recoil';
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

type UserState = number | null;

const userState = atom<UserState>({
  key: 'user',
  default: null,
  // ページ更新しても値が保持されるようにする
  effects_UNSTABLE: [persistAtom],
});

export const useUserState = () => {
  const [user, setUser] = useRecoilState<UserState>(userState);

  return { user, setUser };
};