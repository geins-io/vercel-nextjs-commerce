import { GeinsCMS } from '@geins/cms';
import { GeinsCore, GeinsMenuType } from '@geins/core';
import { MenuItemType, PageType } from './types';

const IMAGE_URL = process.env.GEINS_IMAGE_URL || 'https://labs.commerce.services';

const reshapeMenu = (geinsMenu: GeinsMenuType,locationId: string) => {
    if(!geinsMenu.menuItems) {
        return [];
    }
    const fixSlugUrl = (url: string) => {
        if(url.indexOf('https') === 0) {
            return url;
        }
        return 'https://'+url;
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

    const title = geinsPage.meta.title || '';
    const today = new Date().toISOString();
    
    const body = geinsPage.containers.map((container: any) => {
        const content = container.content.map((item: any) => {          
            if(item.config.type === 'TextPageWidget') {
                return `
                <h3>${item.data.title}</h3>
                <p>
                ${item.data.text}
                </p>
                `;
            }
            if(item.config.type === 'HTMLPageWidget') {
                return `${item.data.html}`;
            }
            if(item.config.type === 'ImagePageWidget') {
                return `<img src="${IMAGE_URL}/pagewidget/600w/${item.data.image.filename}" alt="${item.data.image.altText}" />`
            }
            return '';
        });        
        return content.join(' ');
    });

    return {
        id: geinsPage.id || '',
        title: geinsPage.title || title,
        handle: alias || '',
        body: body || '',
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

    return rehaped;
}
