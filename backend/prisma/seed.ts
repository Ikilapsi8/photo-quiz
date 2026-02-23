import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const questions = [
  {
    index: 0,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
    prompt: "What is shown in this photo?",
    options: [
      { id: "q0a", label: "A sunset over mountains" },
      { id: "q0b", label: "A flower in a garden" },
      { id: "q0c", label: "A city skyline" },
      { id: "q0d", label: "A forest trail" },
    ],
    correctOptionId: "q0b",
  },
  {
    index: 1,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/1200px-Camponotus_flavomarginatus_ant.jpg",
    prompt: "What insect is this?",
    options: [
      { id: "q1a", label: "Bee" },
      { id: "q1b", label: "Ant" },
      { id: "q1c", label: "Beetle" },
      { id: "q1d", label: "Wasp" },
    ],
    correctOptionId: "q1b",
  },
  {
    index: 2,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
    prompt: "What are these objects?",
    options: [
      { id: "q2a", label: "Dice" },
      { id: "q2b", label: "Rubik's cubes" },
      { id: "q2c", label: "Building blocks" },
      { id: "q2d", label: "Chocolates" },
    ],
    correctOptionId: "q2a",
  },
  {
    index: 3,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg",
    prompt: "What animal is this?",
    options: [
      { id: "q3a", label: "Dog" },
      { id: "q3b", label: "Rabbit" },
      { id: "q3c", label: "Cat" },
      { id: "q3d", label: "Fox" },
    ],
    correctOptionId: "q3c",
  },
  {
    index: 4,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/800px-Red_Apple.jpg",
    prompt: "What fruit is this?",
    options: [
      { id: "q4a", label: "Pear" },
      { id: "q4b", label: "Apple" },
      { id: "q4c", label: "Peach" },
      { id: "q4d", label: "Plum" },
    ],
    correctOptionId: "q4b",
  },
  {
    index: 5,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg/1200px-Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg",
    prompt: "Which mountain is this?",
    options: [
      { id: "q5a", label: "K2" },
      { id: "q5b", label: "Mount Kilimanjaro" },
      { id: "q5c", label: "Mount Everest" },
      { id: "q5d", label: "Mont Blanc" },
    ],
    correctOptionId: "q5c",
  },
  {
    index: 6,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Tux.png/220px-Tux.png",
    prompt: "What does this mascot represent?",
    options: [
      { id: "q6a", label: "Windows" },
      { id: "q6b", label: "Linux" },
      { id: "q6c", label: "macOS" },
      { id: "q6d", label: "Android" },
    ],
    correctOptionId: "q6b",
  },
  {
    index: 7,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    prompt: "Who painted this?",
    options: [
      { id: "q7a", label: "Claude Monet" },
      { id: "q7b", label: "Pablo Picasso" },
      { id: "q7c", label: "Vincent van Gogh" },
      { id: "q7d", label: "Salvador Dalí" },
    ],
    correctOptionId: "q7c",
  },
  {
    index: 8,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sunflower_from_Silesia2.jpg/800px-Sunflower_from_Silesia2.jpg",
    prompt: "What flower is this?",
    options: [
      { id: "q8a", label: "Daisy" },
      { id: "q8b", label: "Rose" },
      { id: "q8c", label: "Tulip" },
      { id: "q8d", label: "Sunflower" },
    ],
    correctOptionId: "q8d",
  },
  {
    index: 9,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/500px-Empire_State_Building_%28aerial_view%29.jpg",
    prompt: "What building is this?",
    options: [
      { id: "q9a", label: "Chrysler Building" },
      { id: "q9b", label: "Empire State Building" },
      { id: "q9c", label: "One World Trade Center" },
      { id: "q9d", label: "Burj Khalifa" },
    ],
    correctOptionId: "q9b",
  },
  {
    index: 10,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/800px-Good_Food_Display_-_NCI_Visuals_Online.jpg",
    prompt: "What food group dominates this image?",
    options: [
      { id: "q10a", label: "Grains" },
      { id: "q10b", label: "Fruits and vegetables" },
      { id: "q10c", label: "Dairy" },
      { id: "q10d", label: "Meat" },
    ],
    correctOptionId: "q10b",
  },
  {
    index: 11,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Eiffel_Tower_20051010.jpg/450px-Eiffel_Tower_20051010.jpg",
    prompt: "Where is this landmark located?",
    options: [
      { id: "q11a", label: "London" },
      { id: "q11b", label: "Berlin" },
      { id: "q11c", label: "Paris" },
      { id: "q11d", label: "Rome" },
    ],
    correctOptionId: "q11c",
  },
];

async function main() {
  console.log("Seeding questions...");

  for (const q of questions) {
    await prisma.question.upsert({
      where: { index: q.index },
      update: {
        imageUrl: q.imageUrl,
        prompt: q.prompt,
        optionsJson: JSON.stringify(q.options),
        correctOptionId: q.correctOptionId,
      },
      create: {
        index: q.index,
        imageUrl: q.imageUrl,
        prompt: q.prompt,
        optionsJson: JSON.stringify(q.options),
        correctOptionId: q.correctOptionId,
      },
    });
  }

  console.log("Seeded 12 questions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
