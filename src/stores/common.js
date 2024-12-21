import { create } from "zustand";

const useCommonStore = create(set => ({
  isKor: JSON.parse(localStorage.getItem("isKor")),
  setIsKor: e =>
    set(state => {
      localStorage.setItem("isKor", e);
      return { isKor: e };
    }),
}));

export default useCommonStore;
