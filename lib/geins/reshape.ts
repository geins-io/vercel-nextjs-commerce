export const reshapeMenu = async (data: any) => {

    const menu: { name: string; slug: string; }[] = [];

    data.forEach((item: any) => {
      const menuItem = {  
        id: item.id,      
        name: item.title,
        slug: item.canonicalUrl,
        path: item.canonicalUrl,
      };      
      menu.push(menuItem);
    });
    
    const m = {
        id: "footer",
        name: "Main Menu",
        items: menu
    };

    return m;
};
  