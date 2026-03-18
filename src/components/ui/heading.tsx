interface HeadingProps {
  title: string;
  description: string;
}

export const Heading: React.FC<HeadingProps> = ({ title, description }) => {
  return (
    <div>
      {/* Use the shared font token so page titles follow the active language. */}
      <h2 className='font-sans text-3xl font-bold tracking-tight'>{title}</h2>
      <p className='text-muted-foreground font-sans text-sm'>{description}</p>
    </div>
  );
};
