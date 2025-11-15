// Generic API call function
async function call({
   url,
   method = "GET",
   body,
   headers = {},
}: {
   url: string;
   method?: "GET" | "POST" | "PUT" | "DELETE";
   body?: string | FormData;
   headers?: Record<string, string>;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
   const res = await fetch(`${url}`, {
      method: method,
      headers,
      body,
   });
   if (!res.ok) {
      console.log(
         "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"
      );
      console.log(res);
      const errorData = await res.json();
      console.error("API call error:", errorData);

      return errorData;
   }
   const data = await res.json();

   return data;
}

export default call;
