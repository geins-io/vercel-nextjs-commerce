import { GeinsCMS } from '@geins/cms';
import { GeinsCore, GeinsMenuType } from '@geins/core';
import { MenuItemType } from './types';

const reshapeMenu = (geinsMenu: GeinsMenuType,locationId: string) => {
    if(!geinsMenu.menuItems) {
        return [];
    }
    
    return geinsMenu.menuItems.map((item) => {       
        let itemPath = item?.canonicalUrl?.split('/').pop() || '';
        if(item?.type === 'category') {
            itemPath = '/search/'+itemPath;
        } else if(item?.type === 'custom') {
            itemPath = item?.canonicalUrl || '';
        }
        return {
            id: locationId+':'+item?.id || '',
            title: item?.title || '',
            path: itemPath || '',
        };
    });
}



const cms = {
    getMenu: async (geinsCore: GeinsCore, locationId: string) : Promise<MenuItemType[]> => {        
        const geinsCMS = new GeinsCMS(geinsCore);
        const menu = await geinsCMS.menu.get({ menuLocationId: locationId }).then((result) => {        
            return result as GeinsMenuType;
        });
        return reshapeMenu(menu,locationId);        
    },    
    getPage: async (geinsCore: GeinsCore, id: string) => {
    },
};


export default cms;

