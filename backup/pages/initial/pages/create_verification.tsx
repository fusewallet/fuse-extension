import { Button } from '@heroui/react';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTimeout } from 'usehooks-ts';

import Icon from '~components/icon';
import { useSonnerToast } from '~hooks/toast';
import { pick_word_exclude_appeared } from '~lib/mnemonic';
import { cn } from '~lib/utils/cn';
import { is_development } from '~lib/utils/env';

interface VerificationQuestion {
    index: number;
    word: string;
    words: string[];
}

function CreateVerificationPage({
    className,
    onBack,
    mnemonic,
    onNext,
}: {
    className?: string;
    onBack: () => void;
    mnemonic: string;
    onNext: () => void;
}) {
    const toast = useSonnerToast();

    const [words, setWords] = useState<string[]>([]);

    useEffect(() => {
        setWords(mnemonic.split(' '));
    }, [mnemonic]);

    const [questions, setQuestions] = useState<VerificationQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({});

    useEffect(() => {
        if (!words.length) return;
        const used = [...words];
        let questions: VerificationQuestion[] = [];
        for (let i = 0; i < 3; i++) {
            let index = Math.floor(Math.random() * words.length);
            while (questions.find((q) => q.index === index)) index = Math.floor(Math.random() * words.length);
            const word = words[index];
            const ws = [word];
            const w1 = pick_word_exclude_appeared(used);
            used.push(w1);
            ws.push(w1);
            const w2 = pick_word_exclude_appeared(used);
            used.push(w2);
            ws.push(w2);
            questions.push({ index, word, words: _.shuffle(ws) });
        }
        questions = _.sortBy(questions, (q) => q.index);
        setQuestions(questions);
    }, [words]);

    const handleWord = useCallback(
        (question: number, answer: number) => {
            answers[question] = answer;
            setAnswers({ ...answers });
        },
        [answers],
    );

    const chosen = useMemo(() => {
        if (!questions.length) return false;
        for (const question of questions) if (answers[question.index] === undefined) return false;
        return true;
    }, [questions, answers]);

    const onConfirm = useCallback(() => {
        if (!chosen) return;
        for (const question of questions) {
            if (question.words[answers[question.index]] !== question.word) {
                toast.error('Verification failed, Please verify again. ');
                return;
            }
        }
        onNext();
    }, [questions, answers, chosen, onNext, toast]);

    // auto answer when testing
    useTimeout(() => {
        if (is_development()) {
            // * when dev
            if (!questions.length) return;
            if (chosen) return;
            for (const question of questions) {
                const answer = question.words.indexOf(question.word);
                answers[question.index] = answer;
            }
            setAnswers({ ...answers });
        }
    }, 300);

    return (
        <div className={cn('relative flex h-full w-full flex-col justify-between', className)}>
            <div className="flex h-[58px] items-center justify-between px-5">
                <div onClick={onBack}>
                    <Icon
                        name="icon-arrow-left"
                        className="h-[14px] w-[19px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                    />
                </div>
                <div onClick={onNext}>
                    <Icon
                        name="icon-close"
                        className="h-[20px] w-[20px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                    />
                </div>
            </div>

            {0 < words.length && 0 < questions.length && (
                <div className="flex w-full flex-1 flex-col justify-between px-5 pb-5">
                    <div className="flex w-full flex-col">
                        <h1 className="text-2xl leading-6 text-[#FFCF13]">Please confirm your seed phrase again</h1>
                        <span className="block pt-[10px] text-xs text-[#999999]">
                            Select your mnemonic words in order.
                        </span>

                        <div className="mt-[37px] flex flex-col gap-y-5">
                            {questions.map((item) => (
                                <div className="flex w-full flex-col items-center gap-y-3" key={item.word}>
                                    <div className="flex w-full gap-x-3">
                                        <span className="text-base font-normal text-[#999999]">Phrase</span>
                                        <span className="text-base font-normal text-white">#{item.index + 1}</span>
                                    </div>

                                    <div className="flex w-full gap-x-[10px]">
                                        {item.words.map((w, i) => (
                                            <div
                                                key={w}
                                                onClick={() => handleWord(item.index, i)}
                                                className={cn(
                                                    'flex h-[50px] flex-1 cursor-pointer items-center justify-center rounded-xl border border-[#333333] text-center text-base font-normal text-[#eeeeee] duration-100 hover:border-[#fece13] hover:text-[#fece13]',
                                                    answers[item.index] === i && 'border-[#fece13] text-[#fece13]',
                                                )}
                                            >
                                                {w}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="h-[48px] bg-[#FFCF13] text-lg font-semibold text-black"
                        isDisabled={!chosen}
                        onPress={onConfirm}
                    >
                        Confirm
                    </Button>
                </div>
            )}
        </div>
    );
}

export default CreateVerificationPage;
