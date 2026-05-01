import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CustomTable = ({ children, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table {...props} className="w-full text-left border-collapse table-auto">
        {children}
      </table>
    </div>
  );
};

export const ChatMessage = ({ message }) =>
  message.role === "user" ? (
    <div className="flex items-end justify-end">
      <div className="bg-gray-300 border-gray-100 border-2 rounded-lg p-2 max-w-lg">
        <p>{message.content}</p>
      </div>
    </div>
  ) : (
    <div className="flex items-end">
      <div className="bg-gray-100 border-gray-300 border-2 rounded-lg p-2 mr-20 w-full">
        <ReactMarkdown
          children={message.content}
          remarkPlugins={[remarkGfm]}
          components={{
            table: CustomTable,
          }}
        />
      </div>
    </div>
  );
