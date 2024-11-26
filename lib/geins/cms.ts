import { GeinsCMS } from '@geins/cms';
import { GeinsCore, GeinsMenuType } from '@geins/core';
import { MenuItemType, PageType } from './types';

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

const reshapePage = (geinsPage: any, alias:string): PageType => {
    if(!geinsPage) {
        undefined;
    }
    // date string of today
    //console.log('**** raw', geinsPage);
    const title = geinsPage.meta.title || '';
    const today = new Date().toISOString();


    return {
        id: alias || '',
        title: alias || '',
        handle: alias || '',
        body: geinsPage?.body || '',
        bodySummary: geinsPage?.bodySummary || '',
        seo: geinsPage?.seo || '',
        createdAt: geinsPage?.createdAt || today ,
        updatedAt: geinsPage?.updatedAt || today,
    };
}



export const getMenu = async (geinsCore: GeinsCore, locationId: string) : Promise<MenuItemType[]> => {        
    const geinsCMS = new GeinsCMS(geinsCore);
    const menu = await geinsCMS.menu.get({ menuLocationId: locationId }).then((result) => {        
        return result as GeinsMenuType;
    });
    return reshapeMenu(menu,locationId);        
}
    
export const getPage = async (geinsCore: GeinsCore, alias: string) => {    
    const geinsCMS = new GeinsCMS(geinsCore);
    const data = await geinsCMS.page.get({ alias }).then((result) => {        
        return result;
    });
    const rehaped = reshapePage(data, alias);
    //console.log('**** getPage rehaped', rehaped);
    return rehaped;
}
