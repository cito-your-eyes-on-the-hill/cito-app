import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Component() {
  return (
    (<div
      key="1"
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Button className="ml-auto mb-4 absolute top-0 right-0 m-4" size="sm">
        About Us
      </Button>
      <div className="space-y-4">
        <h1
          className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
          Enter your ZIP code
        </h1>
        <div className="w-full max-w-sm space-y-2">
          <form className="flex space-x-2">
            <Input className="max-w-lg flex-1" placeholder="Enter your ZIP code" type="text" />
            <Button type="submit">Submit</Button>
          </form>
        </div>
        <div className="w-full max-w-sm space-y-2">
          <Button className="w-full">View Latest News</Button>
        </div>
      </div>
    </div>)
  );
}
