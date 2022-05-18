import { atom, selector } from 'recoil';
import axios from 'axios';

export const organizationsSelector = selector({
  key: 'organizationManagement.organizations',
  get: async ({ get }) => {
    try {
      const response = await axios.get('api/organizations');
      const data = response.data;
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  },
});
