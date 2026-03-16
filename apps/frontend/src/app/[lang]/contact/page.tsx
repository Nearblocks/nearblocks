import { Contact } from '@/components/contact';

const ContactPage = async () => {
  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="container mx-auto px-4">
        <Contact />
      </div>
    </main>
  );
};

export default ContactPage;
