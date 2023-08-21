
const AdminNav = () => {
  return (
    <div className="grid grid-cols-6 gap-3 col-span-4 font-bold w-full text-center items-center">
      <a href={"/admin/panel"} className='truncate hover:border-2 hover:border-gray-700 bg-[#292929] px-4 py-1 rounded-md'>Panel</a>
      <a className="truncate bg-[#292929] hover:border-2 hover:border-gray-700 px-4 py-1 rounded-md">A very good Admin</a>
      <a className="truncate bg-[#292929] hover:border-2 hover:border-gray-700 px-4 py-1 rounded-md">Admin</a>
    </div>
  );
}

export default AdminNav;
