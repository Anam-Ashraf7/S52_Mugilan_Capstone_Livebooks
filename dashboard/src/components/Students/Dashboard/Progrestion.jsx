import React, { useEffect, useState } from "react";
import { useLazyGetPaidCoursesQuery } from "../../../../redux/features/courses/courseApi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import FreeCoursess from "@/assets/FreeCourses.webp";

function Progrestion() {
  const [paidCourses, setPaidCourses] = useState([]);
  const courses = useSelector((state) => state.auth.user.courses);
  const [getBoughtCourses, { isSuccess, data, error }] =
    useLazyGetPaidCoursesQuery();

  useEffect(() => {
    const fetchCourses = async () => {
      const promises = courses.map((course) => getBoughtCourses(course._id));
      const responses = await Promise.all(promises);
      const fetchedCourses = responses.map((response) => response.data.course);
      setPaidCourses(fetchedCourses);
    };
    fetchCourses();
  }, []);
  return (
    <div className="w-[100%] 1000px:w-[50%] h-[100%] 1000px:h-full">
      <div >
        <div>
          <div className="font-normal pl-3 text-lg 1200px:text-xl">
            Course Progression
          </div>
        </div>
        {paidCourses &&
          paidCourses.map((items, index) => (
            <Link
              to={`/course/${items._id}`}
              key={index}
              className="w-full gap-3 p-3 flex flex-col h-full "
            >
              <div className=" h-[250px] 1000px:h-full w-full ">
                <div className=" bg-[#87A1EC] border-2 border-black flex flex-col h-full w-full rounded-md  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className=" w-full max-h-[60%] h-full bg-yellow-200 rounded-t-lg">
                  <img
                      className="h-full w-full"
                      src={items.thumbnail?.url || FreeCoursess }
                      alt=""
                    />
                  </div>
                  <div className=" w-full h-[40%] rounded-b-lg p-3 ">
                    <div className=" flex flex-col h-full w-full justify-between">
                      <div className="1000px:text-sm 1200px:text-base">
                      {items.name}
                      </div>
                      <div className="font-light text-xs 1200px:text-sm">
                        {items.description}
                      </div>
                      <div className=" w-full h-auto ">
                        <div className=" text-right 1000px:text-xs 1200px:text-sm">
                          30%
                        </div>
                        <div className=" bg-neutral-600 w-full h-[10px] rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default Progrestion;
