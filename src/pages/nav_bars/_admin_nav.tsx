
const AdminNav = () => {
  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 sm:hidden font-bold w-full text-center items-center">
        <a onClick={() => alert("uwu")}>navbar</a>
      </div>

      <div className=" grid-cols-3 sm:grid-cols-6 gap-x-3 hidden font-bold w-full text-center items-center ">
        <a href={"/admin/panel"} className='text-clip hover:border-2 hover:border-gray-700 bg-[#292929] px-4 py-1 rounded-md'>Panel</a>
        <a className="text-clip truncate bg-[#292929] hover:border-2 hover:border-gray-700 px-4 py-1 rounded-md">Admin</a>
        <a className=" bg-[#292929] hover:border-2 hover:border-gray-700 px-4 py-1 rounded-md">Admin</a>
      </div>
    </div>
  );
}

export default AdminNav;
